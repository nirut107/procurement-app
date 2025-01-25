import { createStore } from "zustand/vanilla";

// ------------ store Order -----------------
export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  orders: Array<{
    itemId: string;
    collection: string;
    price: number;
    piece: number;
    amount: number;
    number: number;
  }>;
  status: string;
  total: number;
  number: number;
  createdAt: string;
  edit: boolean;
  remark: string;
};

export type Item = {
  itemId: string;
  name: string;
  price: number;
  stock: number;
  version: string;
  searchstring: string;
};

export type Customer = {
  customerCode: String;
  customerName: String;
  saleCode: String;
  email: String;
  province: String;
};

export type Tasks = {
  id: string;
  month: string;
  year: string;
  goal: number;
};

export type CounterState = {
  order: Order[];
  item: Item[];
  customer: Customer[];
  openOrder: boolean;
  editOrder: Order | null;
  pdf: Blob | null;
  task: Tasks[];
};

export const defaultInitState: CounterState = {
  order: [],
  item: [],
  customer: [],
  openOrder: false,
  editOrder: null,
  pdf: null,
  task: [],
};

export type CounterActions = {
  createOrder: (neworder: any) => void;
  createStock: (item: any) => void;
  createCustomer: (customer: any) => void;
  setOpenOrder: (status: boolean) => void;
  createEditOrder: (edit: any) => void;
  createPdf: (order: any) => void;
  creatTask: (task: any) => void;
};

export type CounterStore = CounterState & CounterActions;

export const createCounterStore = (
  initState: CounterState = defaultInitState
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    createOrder: (neworder) => set(() => ({ order: neworder })),
    createStock: (item) => set(() => ({ item: item })),
    createCustomer: (customer) => set(() => ({ customer: customer })),
    setOpenOrder: (status: boolean) =>
      set((state) => ({
        ...state,
        openOrder: status,
      })),
    createEditOrder: (edit) => set(() => ({ editOrder: edit })),
    createPdf: (newOrder) =>
      set(() => ({
        pdf: newOrder,
      })),
    creatTask: (task) => set(() => ({ task: task })),
  }));
};
