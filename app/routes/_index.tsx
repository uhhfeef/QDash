import { useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';

export const loader: LoaderFunction = async () => {
  const csvData = `row,col1,col2,col3,col4,size
1,1,0,1,2,117
2,0,1,0,1,95
3,1,1,0,0,105`;

  const parsedData = Papa.parse(csvData, { header: true }).data;
  return json(parsedData);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [selectedColumn, setSelectedColumn] = useState('col1');
  const [Plot, setPlot] = useState<any>(null); // State to hold the Plot component

  useEffect(() => {
    // Dynamically import Plot only on the client side
    import('react-plotly.js').then((module) => {
      setPlot(() => module.default);
    });
  }, []);

  const plotData = [{
    x: data.map((row: any) => row.row),
    y: data.map((row: any) => row[selectedColumn]),
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'blue' },
  }];

  const layout = {
    title: `Plot of ${selectedColumn}`,
    xaxis: { title: 'Row Number' },
    yaxis: { title: selectedColumn },
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>CSV Plotter</h1>
      <select 
        value={selectedColumn} 
        onChange={(e) => setSelectedColumn(e.target.value)}
        style={{ marginBottom: '20px' }}
      >
        {Object.keys(data[0]).filter(key => key !== 'row').map(key => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>
      {Plot && ( // Render Plot only if it's loaded
        <Plot
          data={plotData}
          layout={layout}
          style={{ width: '100%', height: '500px' }}
        />
      )}
    </div>
  );
}
