import { ROUTES, ADMIN_ROUTES } from './routes';

describe('ROUTES', () => {
  it('has correct static routes', () => {
    expect(ROUTES.home).toBe('/');
    expect(ROUTES.catalog).toBe('/catalog');
    expect(ROUTES.about).toBe('/about');
    expect(ROUTES.branding).toBe('/branding');
    expect(ROUTES.delivery).toBe('/delivery');
    expect(ROUTES.contacts).toBe('/contacts');
    expect(ROUTES.cart).toBe('/cart');
    expect(ROUTES.checkout).toBe('/checkout');
    expect(ROUTES.account).toBe('/account');
    expect(ROUTES.login).toBe('/login');
    expect(ROUTES.register).toBe('/register');
  });

  it('product() generates correct slug URL', () => {
    expect(ROUTES.product('eco-bottle')).toBe('/catalog/eco-bottle');
    expect(ROUTES.product('some-product-slug')).toBe('/catalog/some-product-slug');
  });

  it('checkoutSuccess() works with number id', () => {
    expect(ROUTES.checkoutSuccess(42)).toBe('/checkout/success/42');
  });

  it('checkoutSuccess() works with string id', () => {
    expect(ROUTES.checkoutSuccess('order-99')).toBe('/checkout/success/order-99');
  });

  it('orderDetail() generates correct URL', () => {
    expect(ROUTES.orderDetail(7)).toBe('/account/orders/7');
    expect(ROUTES.orderDetail(100)).toBe('/account/orders/100');
  });
});

describe('ADMIN_ROUTES', () => {
  it('has correct static routes', () => {
    expect(ADMIN_ROUTES.dashboard).toBe('/admin');
    expect(ADMIN_ROUTES.orders).toBe('/admin/orders');
    expect(ADMIN_ROUTES.products).toBe('/admin/products');
    expect(ADMIN_ROUTES.productNew).toBe('/admin/products/new');
    expect(ADMIN_ROUTES.content).toBe('/admin/content');
    expect(ADMIN_ROUTES.users).toBe('/admin/users');
    expect(ADMIN_ROUTES.payment).toBe('/admin/settings/payment');
    expect(ADMIN_ROUTES.delivery).toBe('/admin/settings/delivery');
    expect(ADMIN_ROUTES.general).toBe('/admin/settings/general');
    expect(ADMIN_ROUTES.login).toBe('/admin/login');
  });

  it('orderDetail() generates correct URL', () => {
    expect(ADMIN_ROUTES.orderDetail(5)).toBe('/admin/orders/5');
    expect(ADMIN_ROUTES.orderDetail('15')).toBe('/admin/orders/15');
  });

  it('productEdit() generates correct URL with number id', () => {
    expect(ADMIN_ROUTES.productEdit(3)).toBe('/admin/products/3/edit');
  });

  it('productEdit() works with string id', () => {
    expect(ADMIN_ROUTES.productEdit('new-product')).toBe('/admin/products/new-product/edit');
  });
});
