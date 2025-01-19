import { createStore } from "zustand/vanilla";

// ------------ store Order -----------------
export type CounterState = {
  order: any;
  item: any;
  customer: any;
  openOrder: boolean;
  editOrder: any;
  pdf: any;
};

export const defaultInitState: CounterState = {
  order: "",
  item: "",
  customer: "",
  openOrder: false,
  editOrder: "",
  pdf: {},
};

export type CounterActions = {
  createOrder: (neworder: any) => void;
  createStock: (item: any) => void;
  createCustomer: (customer: any) => void;
  setOpenOrder: (status: boolean) => void;
  createEditOrder: (edit: any) => void;
  createPdf: (order: any) => void;
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
  }));
};
