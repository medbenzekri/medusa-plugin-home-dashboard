import { AbstractNotificationService, Logger, OrderService , CartService, LineItemService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"

class DashboardNotificationsService extends AbstractNotificationService {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager
  protected orderService: OrderService
  protected cartService: CartService
  protected logger: Logger
  static identifier = "dashboard-notifications"

  constructor(container) {
    super(container)
    // you can access options here in case you're
    // using a plugin
    this.logger = container.logger
    this.orderService = container.orderService
    this.cartService = container.cartService
  }

  async sendNotification(
    event: string,
    data: unknown,
    attachmentGenerator: unknown
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    if (event === "order.placed") {
      // cast data to a known type with an id property
      const orderData = data as { id: string };
      // retrieve order
      const order = await this.orderService.retrieveWithTotals(orderData.id, {
        relations: ["customer"],
      });
      const firstName = order.customer.first_name || "a Visitor";
      const lastName = order.customer.last_name || "a Visitor";
      this.logger.info(
        `New Order from ${firstName} ${lastName} with total ${
          order.total / 100
        }${order.currency_code}`
      );
      return {
        to: "dashboard",
        status: "success",
        data: {
          title: "New Order",
          message: `New Order from ${firstName} ${lastName} with total ${
            order.total / 100
          }${order.currency_code}`,
          order: order,
          customer: order.customer,
        },
      };
    } else if (event === "cart.updated") {
      // cast data to a known type with an id property
      const cartData = data as { id: string };
      // retrieve order
      const cart = await this.cartService.retrieve(cartData.id, {
        relations: ["customer","items"],
      });

      
      const customer_name = (cart.customer)? `${cart.customer.first_name} ${cart.customer.last_name}`:  "a Visitor";
      this.logger.info(
        `User ${customer_name} had added ${cart.items.length} items to their cart`
      );
      return {
        to: "dashboard",
        status: "success",
        data: {
          title: "Cart Updated",
          message: `Cart updated for ${customer_name}`,
          cart: cart,
          customer: cart.customer,
        },
      };
    } else {
      this.logger.warn(`Unknown event ${event} received`);
      return {
        to: "dashboard",
        status: "success",
        data: {
          title: "Unknown Event",
          message: `Unknown event ${event} received`,
        },
      };
    }
}
 
  
  async resendNotification(
    notification: unknown,
    config: unknown,
    attachmentGenerator: unknown
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    throw new Error("Method not implemented.")
  }

}

export default DashboardNotificationsService