import { useState } from 'react';
import { getPlacementRecommendations } from '../services/apiService';

const PlacementComponent = () => {
    const [placementData, setPlacementData] = useState(null);
    const [inputData, setInputData] = useState({
        items: [],
        containers: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePlacement = async () => {
        setLoading(true);
        setError('');
        try {
            // Format data to match FrontendPlacementInput schema
            const formattedInputData = {
                items: inputData.items.map(item => ({
                    itemId: item.item_id || '',
                    name: item.name || '',
                    width: parseFloat(item.width_cm) || 0,
                    depth: parseFloat(item.depth_cm) || 0,
                    height: parseFloat(item.height_cm) || 0,
                    priority: parseInt(item.priority) || 0,
                    expiryDate: item.expiry_date || '',
                    usageLimit: parseInt(item.usage_limit) || 0,
                    preferredZone: item.preferred_zone || ''
                })),
                containers: inputData.containers.map(container => ({
                    container_id: container.container_id || '',
                    zone: container.zone || '',
                    width_cm: parseFloat(container.width_cm) || 0,
                    depth_cm: parseFloat(container.depth_cm) || 0,
                    height_cm: parseFloat(container.height_cm) || 0
                }))
            };

            console.log('Sending placement request with data:', formattedInputData);
            const response = await getPlacementRecommendations(formattedInputData);
            console.log('Received placement response:', response);

            if (response.data) {
                setPlacementData(response.data);
                
                if (!response.data.success) {
                    setError('Failed to generate placement recommendations');
                }
            } else {
                setError('Failed to generate placement recommendations');
            }
        } catch (err) {
            console.error("Placement Error:", err);
            console.error("Error details:", err.response?.data || err.message);
            
            // Handle validation errors from FastAPI
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    // Multiple validation errors
                    const errorMessages = err.response.data.detail.map(error => 
                        `${error.loc.join('.')}: ${error.msg}`
                    ).join('\n');
                    setError(errorMessages);
                } else if (typeof err.response.data.detail === 'object') {
                    // Single validation error object
                    setError(`${err.response.data.detail.loc.join('.')}: ${err.response.data.detail.msg}`);
                } else {
                    // Simple error message
                    setError(err.response.data.detail);
                }
            } else {
                setError(err.message || 'Failed to process placement request');
            }
        }
        setLoading(false);
    };

    const handleJsonInput = (e) => {
        try {
            const data = JSON.parse(e.target.value);
            console.log('Parsed JSON input:', data);
            if (!data.items || !Array.isArray(data.items)) {
                throw new Error('Invalid items format');
            }
            if (!data.containers || !Array.isArray(data.containers)) {
                throw new Error('Invalid containers format');
            }

            setInputData(data);
            setError('');
        } catch (err) {
            console.error('JSON parsing error:', err);
            setError('Invalid JSON format. Please provide both items and containers arrays.');
        }
    };

    return (
        <div className="p-6 bg-gray-100 shadow-md rounded-md w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Cargo Placement</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Input Data (JSON format)</label>
                <textarea
                    placeholder={`{
  "items": [
    {
      "itemId": "1",
      "name": "Item 1",
      "width": 10,
      "depth": 10,
      "height": 10,
      "priority": 1,
      "expiryDate": "",
      "usageLimit": 1,
      "preferredZone": "A"
    }
  ],
  "containers": [
    {
      "container_id": "C1",
      "zone": "A",
      "width_cm": 100,
      "depth_cm": 100,
      "height_cm": 100
    }
  ]
}`}
                    onChange={handleJsonInput}
                    className="border p-2 w-full h-96 mb-2 rounded-md font-mono text-sm"
                />
            </div>
            
            <button
                onClick={handlePlacement}
                disabled={loading || !inputData.items.length || !inputData.containers.length}
                className={`py-2 px-4 rounded-md w-full mb-2 ${
                    loading || !inputData.items.length || !inputData.containers.length
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
            >
                {loading ? 'Processing...' : 'Generate Placement'}
            </button>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md whitespace-pre-wrap">
                    {error}
                </div>
            )}

            {placementData && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Placement Results</h3>
                    
                    <div className="bg-white rounded-md shadow p-4 mb-4">
                        <h4 className="font-medium mb-2">Placements ({placementData.placements.length})</h4>
                        <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(placementData.placements, null, 2)}
                        </pre>
                    </div>

                    {placementData.rearrangements.length > 0 && (
                        <div className="bg-white rounded-md shadow p-4">
                            <h4 className="font-medium mb-2">Required Rearrangements ({placementData.rearrangements.length})</h4>
                            <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
                                {JSON.stringify(placementData.rearrangements, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlacementComponent;