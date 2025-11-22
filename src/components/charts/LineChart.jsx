import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function SimpleLineChart({ data, dataKey = 'value', color = '#1C64F2' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}