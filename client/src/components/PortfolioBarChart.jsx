import React from 'react';
import { BarChart, Bar, Cell, Legend, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699', '#33CC99', '#FF6666'];

function PortfolioBarChart({ stocks, totalValue }) {
  const pieData = stocks.map(stock => ({
    name: stock.company_symbol,
    value: Math.round(
      stock.quantity * stock.price * (stock.stock_exchanges.currencies.ratio_to_master_currency || 1) / totalValue * 100
    )
  }));

  return (
    <div style={{ width: '100%', height: 80, marginTop: 40 }}>
      <ResponsiveContainer>
        <BarChart
          data={[pieData.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.value }), {})]}
          layout="vertical"
          stackOffset="expand"
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis type="category" dataKey={() => ''} hide />
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          <Legend />
          {pieData.map((entry, index) => (
            <Bar
              key={entry.name}
              dataKey={entry.name}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              isAnimationActive={false}
              name={entry.name}
              barSize={40}
              label={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioBarChart;
