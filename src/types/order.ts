
export interface Order {
  id: string;
  status: string;
  menu: {
    title: string;
  };
  quantity: number;
  shipping_details: any;
  customer: {
    full_name: string;
    phone: string;
  };
  mom: {
    full_name: string;
    phone: string;
    address: any;
  };
}
