import { 
  FaShoppingCart, 
  FaUsers, 
  FaChartLine, 
  FaDollarSign,
  FaRegCalendarAlt
} from 'react-icons/fa';
import DashboardNav from './components/DashboardNav';
import DashboardHeader from './components/DashboardHeader';
import DashboardCard from './components/DashboardCard';
import StatsCard from './components/StatsCard';
import PieChart from './components/PieChart';
import LineChart from './components/LineChart';
// import { getDOMStructure, getDOMTree } from './test.js';
import { useEffect } from 'react';

function App() {
  const pieChartData = [
    { value: 35, color: '#FF6384', label: 'Products' },
    { value: 45, color: '#36A2EB', label: 'Services' },
    { value: 20, color: '#FFCE56', label: 'Other' }
  ];

  const lineChartData = Array.from({ length: 12 }, (_, i) => ({
    value: Math.floor(Math.random() * 50) + 50
  }));

  // useEffect(() => {
  //   console.log('DOM Structure:');
  //   getDOMStructure();
  //   console.log('DOM Tree:');
  //   console.log(getDOMTree());
  // }, []);

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 bg-gray-50">
        <DashboardHeader />
        
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Sales" 
              value="$24,780"
              change="12.5"
              icon={FaDollarSign}
              trend="up"
            />
            <StatsCard 
              title="Total Users" 
              value="1,429"
              change="8.2"
              icon={FaUsers}
              trend="up"
            />
            <StatsCard 
              title="Orders" 
              value="458"
              change="5.1"
              icon={FaShoppingCart}
              trend="down"
            />
            <StatsCard 
              title="Growth" 
              value="15.2%"
              change="2.4"
              icon={FaChartLine}
              trend="up"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Revenue Distribution">
              <PieChart data={pieChartData} /> 
            </DashboardCard>
            <DashboardCard title="Monthly Sales Trend">
              <LineChart data={lineChartData} />
            </DashboardCard><DashboardCard title="Monthly Sales Trend">
              <LineChart data={lineChartData} />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Recent Orders">
              <RecentOrders />
            </DashboardCard>
            <DashboardCard title="Upcoming Tasks">
              <TaskList />
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function RecentOrders() {
  const orders = [
    { id: '1', customer: 'Jane Cooper', product: 'Product A', status: 'Completed', amount: '$250' },
    { id: '2', customer: 'Wade Warren', product: 'Product B', status: 'Pending', amount: '$120' },
    { id: '3', customer: 'Esther Howard', product: 'Product C', status: 'Processing', amount: '$350' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {orders.map(order => (
        <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col">
            <span className="font-medium">{order.customer}</span>
            <span className="text-gray-500">{order.product}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm
              ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : ''}
              ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : ''}
              ${order.status === 'Processing' ? 'bg-blue-100 text-blue-600' : ''}
            `}>
              {order.status}
            </span>
            <span className="font-medium">{order.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskList() {
  const tasks = [
    { id: '1', title: 'Review quarterly reports', date: 'Today', priority: 'high' },
    { id: '2', title: 'Team meeting', date: 'Tomorrow', priority: 'medium' },
    { id: '3', title: 'Update documentation', date: 'Next Week', priority: 'low' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {tasks.map(task => (
        <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FaRegCalendarAlt className="text-gray-400" />
            <span className="font-medium">{task.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">{task.date}</span>
            <span className={`px-3 py-1 rounded-full text-sm
              ${task.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
              ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
              ${task.priority === 'low' ? 'bg-green-100 text-green-600' : ''}
            `}>
              {task.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
