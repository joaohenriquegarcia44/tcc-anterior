export function useQRCodePedidoLogic(route: any) {
  const { pedidos } = route.params;

  return {
    pedidos,
  };
}
