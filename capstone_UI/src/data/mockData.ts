export type Role = 'Administrator' | 'Manager' | 'Employee' | 'Customer'

export interface AuthUser {
  username: string
  password: string
  name: string
  role: Role
}

export const users: AuthUser[] = [
  { username: 'admin', password: 'password', name: 'Alan Mangubat', role: 'Administrator' },
  { username: 'manager', password: 'password', name: 'James Swe', role: 'Manager' },
  { username: 'employee', password: 'password', name: 'Saul Ojeda', role: 'Employee' },
]

export interface Customer {
  id: string
  name: string
  email: string
  rewardPoints: number
  joined: string
}

export const customers: Customer[] = [
  { id: 'C-1001', name: 'Maria Chen', email: 'maria.chen@example.com', rewardPoints: 1280, joined: '2024-02-11' },
  { id: 'C-1002', name: 'David Okafor', email: 'david.okafor@example.com', rewardPoints: 340, joined: '2024-05-03' },
  { id: 'C-1003', name: 'Priya Natarajan', email: 'priya.n@example.com', rewardPoints: 92, joined: '2024-07-22' },
  { id: 'C-1004', name: 'Liam Brooks', email: 'liam.brooks@example.com', rewardPoints: 2110, joined: '2023-11-30' },
  { id: 'C-1005', name: 'Sofia Reyes', email: 'sofia.reyes@example.com', rewardPoints: 15, joined: '2025-01-09' },
  { id: 'C-1006', name: 'Ethan Walker', email: 'ethan.walker@example.com', rewardPoints: 680, joined: '2024-09-14' },
  { id: 'C-1007', name: 'Grace Kim', email: 'grace.kim@example.com', rewardPoints: 455, joined: '2025-03-02' },
  { id: 'C-1008', name: 'Noah Patel', email: 'noah.patel@example.com', rewardPoints: 1990, joined: '2023-08-17' },
  { id: 'C-1009', name: 'Isabella Rossi', email: 'isabella.rossi@example.com', rewardPoints: 60, joined: '2025-05-27' },
  { id: 'C-1010', name: 'Marcus Lee', email: 'marcus.lee@example.com', rewardPoints: 810, joined: '2024-12-01' },
]

export interface Product {
  sku: string
  name: string
  category: 'Electronics' | 'Home Goods' | 'Apparel' | 'Other'
  stock: number
  price: number
  lowStockThreshold: number
}

export const products: Product[] = [
  { sku: 'SKU-1001', name: 'Wireless Earbuds', category: 'Electronics', stock: 84, price: 59.99, lowStockThreshold: 20 },
  { sku: 'SKU-1188', name: 'USB-C Fast Charger', category: 'Electronics', stock: 12, price: 24.99, lowStockThreshold: 20 },
  { sku: 'SKU-2865', name: 'Bluetooth Speaker', category: 'Electronics', stock: 6, price: 44.5, lowStockThreshold: 20 },
  { sku: 'SKU-3042', name: 'Ceramic Cookware Set', category: 'Home Goods', stock: 19, price: 89.0, lowStockThreshold: 20 },
  { sku: 'SKU-3110', name: 'Throw Blanket', category: 'Home Goods', stock: 55, price: 32.0, lowStockThreshold: 20 },
  { sku: 'SKU-3299', name: 'Table Lamp', category: 'Home Goods', stock: 41, price: 27.75, lowStockThreshold: 20 },
  { sku: 'SKU-4021', name: "Men's Denim Jacket", category: 'Apparel', stock: 30, price: 69.99, lowStockThreshold: 20 },
  { sku: 'SKU-4188', name: "Women's Running Shoes", category: 'Apparel', stock: 8, price: 79.99, lowStockThreshold: 20 },
  { sku: 'SKU-4290', name: 'Cotton T-Shirt (3-pack)', category: 'Apparel', stock: 120, price: 22.5, lowStockThreshold: 20 },
  { sku: 'SKU-5010', name: 'Reusable Water Bottle', category: 'Other', stock: 73, price: 14.99, lowStockThreshold: 20 },
  { sku: 'SKU-5044', name: 'Notebook Set', category: 'Other', stock: 17, price: 9.99, lowStockThreshold: 20 },
  { sku: 'SKU-5091', name: 'Desk Organizer', category: 'Other', stock: 26, price: 19.25, lowStockThreshold: 20 },
]

export interface TransactionItem {
  sku: string
  name: string
  qty: number
  price: number
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  items: TransactionItem[]
  total: number
  date: string
}

export const transactions: Transaction[] = [
  {
    id: 'TXN-9001',
    customerId: 'C-1001',
    customerName: 'Maria Chen',
    items: [
      { sku: 'SKU-1001', name: 'Wireless Earbuds', qty: 1, price: 59.99 },
      { sku: 'SKU-5010', name: 'Reusable Water Bottle', qty: 2, price: 14.99 },
    ],
    total: 89.97,
    date: '2026-08-14',
  },
  {
    id: 'TXN-9002',
    customerId: 'C-1004',
    customerName: 'Liam Brooks',
    items: [{ sku: 'SKU-4021', name: "Men's Denim Jacket", qty: 1, price: 69.99 }],
    total: 69.99,
    date: '2026-08-14',
  },
  {
    id: 'TXN-9003',
    customerId: 'C-1008',
    customerName: 'Noah Patel',
    items: [
      { sku: 'SKU-3110', name: 'Throw Blanket', qty: 1, price: 32.0 },
      { sku: 'SKU-3299', name: 'Table Lamp', qty: 2, price: 27.75 },
    ],
    total: 87.5,
    date: '2026-08-13',
  },
  {
    id: 'TXN-9004',
    customerId: 'C-1002',
    customerName: 'David Okafor',
    items: [{ sku: 'SKU-4290', name: 'Cotton T-Shirt (3-pack)', qty: 3, price: 22.5 }],
    total: 67.5,
    date: '2026-08-12',
  },
  {
    id: 'TXN-9005',
    customerId: 'C-1010',
    customerName: 'Marcus Lee',
    items: [{ sku: 'SKU-2865', name: 'Bluetooth Speaker', qty: 1, price: 44.5 }],
    total: 44.5,
    date: '2026-08-10',
  },
  {
    id: 'TXN-9006',
    customerId: 'C-1006',
    customerName: 'Ethan Walker',
    items: [
      { sku: 'SKU-4188', name: "Women's Running Shoes", qty: 1, price: 79.99 },
      { sku: 'SKU-5044', name: 'Notebook Set', qty: 1, price: 9.99 },
    ],
    total: 89.98,
    date: '2026-08-09',
  },
  {
    id: 'TXN-9007',
    customerId: 'C-1001',
    customerName: 'Maria Chen',
    items: [{ sku: 'SKU-5091', name: 'Desk Organizer', qty: 2, price: 19.25 }],
    total: 38.5,
    date: '2026-07-28',
  },
]

export const weeklySales = [
  { day: 'Mon', unitsSold: 120, returns: 8 },
  { day: 'Tue', unitsSold: 98, returns: 5 },
  { day: 'Wed', unitsSold: 145, returns: 12 },
  { day: 'Thu', unitsSold: 132, returns: 6 },
  { day: 'Fri', unitsSold: 180, returns: 15 },
  { day: 'Sat', unitsSold: 210, returns: 20 },
  { day: 'Sun', unitsSold: 160, returns: 9 },
]

export const categoryBreakdown = [
  { category: 'Electronics', value: 38 },
  { category: 'Home Goods', value: 26 },
  { category: 'Apparel', value: 24 },
  { category: 'Other', value: 12 },
]

export const revenueTrend = [
  { month: 'Feb', revenue: 18200 },
  { month: 'Mar', revenue: 21400 },
  { month: 'Apr', revenue: 19800 },
  { month: 'May', revenue: 24600 },
  { month: 'Jun', revenue: 27300 },
  { month: 'Jul', revenue: 25100 },
  { month: 'Aug', revenue: 29800 },
]

export interface ActivityEvent {
  id: string
  type: 'sale' | 'inventory' | 'signup'
  message: string
  time: string
}

export const recentActivity: ActivityEvent[] = [
  { id: 'A-1', type: 'sale', message: 'Sale finalized — TXN-9001 ($89.97) for Maria Chen', time: '5 min ago' },
  { id: 'A-2', type: 'inventory', message: 'Inventory updated — SKU-1188 restocked to 40 units', time: '22 min ago' },
  { id: 'A-3', type: 'signup', message: 'New customer sign-up — Grace Kim', time: '1 hr ago' },
  { id: 'A-4', type: 'sale', message: 'Sale finalized — TXN-9002 ($69.99) for Liam Brooks', time: '2 hr ago' },
  { id: 'A-5', type: 'inventory', message: 'Low stock alert — SKU-2865 at 6 units', time: '3 hr ago' },
]
