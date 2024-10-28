import { useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

export const loader: LoaderFunction = async () => {
  const filePath = path.join(process.cwd(), 'public', 'EdTech_Sample_Data.csv');
  const csvContent = await fs.readFile(filePath, 'utf-8');
  const parsedData = Papa.parse(csvContent, { header: true }).data;
  return json(parsedData);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [Plot, setPlot] = useState<any>(null);
  const [plotType, setPlotType] = useState('scatter');
  const [theme, setTheme] = useState('modern');

  useEffect(() => {
    import('react-plotly.js').then((module) => {
      setPlot(() => module.default);
    });
  }, []);

  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    !isNaN(Number(data[0][key])) && key !== 'id' && key !== 'index'
  );

  const colorSchemes = {
    modern: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'],
    ocean: ['#1A535C', '#4ECDC4', '#45B7D1', '#6B98BF', '#307473', '#26495C'],
    sunset: ['#FF6B6B', '#FFE66D', '#F7B267', '#F4845F', '#F25C54', '#F25C54'],
  };

  const selectedColors = colorSchemes[theme as keyof typeof colorSchemes];

  const plotData = selectedColumns.map((column, index) => ({
    name: column,
    x: data.map((row: any, index: number) => index + 1),
    y: data.map((row: any) => Number(row[column])),
    type: plotType,
    mode: plotType === 'scatter' ? 'lines+markers' : undefined,
    marker: {
      color: selectedColors[index % selectedColors.length],
      size: 8,
      line: {
        color: '#fff',
        width: 1
      }
    },
    line: {
      color: selectedColors[index % selectedColors.length],
      width: 2
    },
    width: plotType === 'bar' ? 0.8 : undefined,
    bargap: plotType === 'bar' ? 0.05 : undefined,
    bargroupgap: plotType === 'bar' ? 0.1 : undefined,
  }));

  const layout = {
    title: {
      text: 'EdTech Data Visualization',
      font: {
        family: 'Arial, sans-serif',
        size: 24,
        color: '#2D3748'
      }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
      title: 'Row Number',
      gridcolor: '#E2E8F0',
      zerolinecolor: '#E2E8F0',
      tickfont: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#4A5568'
      }
    },
    yaxis: {
      title: 'Value',
      gridcolor: '#E2E8F0',
      zerolinecolor: '#E2E8F0',
      tickfont: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#4A5568'
      }
    },
    height: 800, // Increased height
    width: null, // Let it be responsive
    autosize: true,
    margin: { t: 80, r: 50, l: 50, b: 80 },
    showlegend: true,
    legend: {
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: '#E2E8F0',
      borderwidth: 1,
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#4A5568'
      },
      orientation: 'h', // Horizontal legend
      y: -0.2, // Position below the plot
      yanchor: 'bottom',
      xanchor: 'center',
      x: 0.5
    },
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: '#FFF',
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#2D3748'
      }
    },
    barmode: 'group', // For grouped bar charts
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            EdTech Data Visualizer
          </h1>
          
          {/* Controls in a horizontal layout */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {/* Plot Type Selection */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visualization Type
              </label>
              <select 
                value={plotType}
                onChange={(e) => setPlotType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="scatter">Line Plot</option>
                <option value="bar">Bar Chart</option>
                <option value="box">Box Plot</option>
              </select>
            </div>

            {/* Theme Selection */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color Theme
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="modern">Modern</option>
                <option value="ocean">Ocean</option>
                <option value="sunset">Sunset</option>
              </select>
            </div>

            {/* Column Selection */}
            <div className="flex-2 min-w-[300px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Data Columns
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-300 rounded-md shadow-inner max-h-32 overflow-y-auto">
                {numericColumns.map(column => (
                  <label 
                    key={column}
                    className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, column]);
                        } else {
                          setSelectedColumns(selectedColumns.filter(col => col !== column));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{column}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Plot Display */}
          <div className="w-full">
            {Plot && selectedColumns.length > 0 ? (
              <div className="w-full bg-white p-4 rounded-lg">
                <Plot
                  data={plotData}
                  layout={layout}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    toImageButtonOptions: {
                      format: 'png',
                      filename: 'edtech_visualization',
                      height: 800,
                      width: 1200,
                      scale: 2
                    }
                  }}
                  style={{ width: '100%', height: '800px' }}
                  useResizeHandler={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[800px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">No Data Selected</p>
                  <p className="text-sm">Please select one or more columns to visualize</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}