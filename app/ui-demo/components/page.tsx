export default function ComponentsDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">UI Components Demo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Button Components</h2>
          <div className="space-y-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Primary Button
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-300 ml-2">
              Secondary Button
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Input Components</h2>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Text Input" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea 
              placeholder="Textarea" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Alert Components</h2>
          <div className="space-y-2">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Success message
            </div>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Warning message
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
