import { useState } from "react";
import { simulateDays } from "../services/apiService";

const SimulationComponent = () => {
  const [formData, setFormData] = useState({
    numOfDays: '',
    toTimestamp: '',
    itemId: '',
    itemName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [simulationResults, setSimulationResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'itemId' ? { itemName: '' } : {}),
      ...(name === 'itemName' ? { itemId: '' } : {})
    }));
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSimulationResults(null);

    try {
      if (!formData.numOfDays) {
        setMessage('Number of days is required');
        return;
      }

      if (!formData.itemId && !formData.itemName) {
        setMessage('Either Item ID or Item Name is required');
        return;
      }

      if (formData.itemId && formData.itemName) {
        setMessage('Please provide either Item ID or Item Name, not both');
        return;
      }

      // Format the request data properly
      const requestData = {
        numOfDays: parseInt(formData.numOfDays),
        toTimestamp: formData.toTimestamp || undefined,
        itemsToBeUsedPerDay: [{
          itemId: formData.itemId.toString()
        }]
      };

      console.log('Sending simulation request:', requestData);
      const response = await simulateDays(requestData);
      console.log('Simulation response:', response);

      if (response.success) {
        setMessage('Simulation completed successfully!');
        setSimulationResults(response);
        setFormData({
          numOfDays: '',
          toTimestamp: '',
          itemId: '',
          itemName: ''
        });
      } else {
        setMessage('Simulation failed');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      setMessage(error.message || 'Failed to simulate time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Time Simulation</h2>
      
      <form onSubmit={handleSimulate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Days
            </label>
            <input
              type="number"
              name="numOfDays"
              value={formData.numOfDays}
              onChange={handleInputChange}
              placeholder="Enter number of days"
              className="w-full border p-2 rounded-md"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date/Time
            </label>
            <input
              type="datetime-local"
              name="toTimestamp"
              value={formData.toTimestamp}
              onChange={handleInputChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item ID
            </label>
            <input
              type="number"
              name="itemId"
              value={formData.itemId}
              onChange={handleInputChange}
              placeholder="Enter Item ID"
              className="w-full border p-2 rounded-md"
              disabled={formData.itemName !== ''}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="Enter Item Name"
              className="w-full border p-2 rounded-md"
              disabled={formData.itemId !== ''}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 italic">
          Note: Provide either Item ID or Item Name, not both
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successfully')
            ? 'bg-green-50 border border-green-200 text-green-600'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {simulationResults && simulationResults.success && (
        <div className="mt-6 space-y-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700 font-medium">
              Simulation Date: {formatDate(simulationResults.newDate)}
            </p>
          </div>

          {simulationResults.changes.itemsUsed.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Items Used:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {simulationResults.changes.itemsUsed.map((item, index) => (
                  <li key={`used-${index}`}>
                    <span className="font-medium">
                      {item.name} (ID: {item.itemId})
                    </span>
                    <br />
                    <span className="text-gray-600">
                      Remaining Uses: {item.remainingUses}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {simulationResults.changes.itemsExpired.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="font-medium mb-2 text-yellow-800">Expired Items:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {simulationResults.changes.itemsExpired.map((item, index) => (
                  <li key={`expired-${index}`} className="text-yellow-800">
                    {item.name} (ID: {item.itemId})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {simulationResults.changes.itemsDepletedToday.length > 0 && (
            <div className="bg-red-50 p-4 rounded-md">
              <h4 className="font-medium mb-2 text-red-800">Items Depleted Today:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {simulationResults.changes.itemsDepletedToday.map((item, index) => (
                  <li key={`depleted-${index}`} className="text-red-800">
                    {item.name} (ID: {item.itemId})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {simulationResults.changes.itemsUsed.length === 0 &&
           simulationResults.changes.itemsExpired.length === 0 &&
           simulationResults.changes.itemsDepletedToday.length === 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-600">No changes to report for this simulation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationComponent;