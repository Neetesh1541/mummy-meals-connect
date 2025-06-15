
export const getStatusClassNames = (status: string) => {
  switch (status) {
    case 'placed':
      return {
        bg: 'bg-yellow-400',
        text: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800',
      };
    case 'preparing':
      return {
        bg: 'bg-orange-400',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800',
      };
    case 'ready':
      return {
        bg: 'bg-blue-400',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
      };
    case 'picked_up':
      return {
        bg: 'bg-indigo-400',
        text: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-800',
      };
    case 'delivered':
      return {
        bg: 'bg-green-500',
        text: 'text-green-600',
        badge: 'bg-green-100 text-green-800',
      };
    default:
      return {
        bg: 'bg-gray-300',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800',
      };
  }
};
