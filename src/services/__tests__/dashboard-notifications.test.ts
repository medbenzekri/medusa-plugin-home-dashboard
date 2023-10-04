import { Container } from "typedi";
import { EntityManager } from "typeorm";
import { Logger, OrderService } from "@medusajs/medusa";
import DashboardNotificationsService from "../dashboard-notifications";

describe("DashboardNotificationsService", () => {
  let dashboardNotificationsService: DashboardNotificationsService;
  let entityManager: EntityManager;
  let orderService: OrderService;
  let logger: Logger;

  beforeEach(() => {
    entityManager = {} as EntityManager;
    orderService = {} as OrderService;
    logger = {} as Logger;

    const container = {
      logger,
      orderService,
    };

    dashboardNotificationsService = new DashboardNotificationsService(container);
    (dashboardNotificationsService as any).transactionManager_ = entityManager;
  });

  describe("getter methods", () => {
    it("should return the value of the manager_ property", () => {
      expect((dashboardNotificationsService as any).getManager()).toBe(entityManager);
    });
  });

  describe("sendNotification", () => {
    it("should return a success status with order data", async () => {
      const order = {
        id: "order-id",
        customer: {
          first_name: "John",
          last_name: "Doe",
        },
        total: 100,
      };
      orderService.retrieve = jest.fn().mockResolvedValue(order);
      logger.warn = jest.fn();

      const result = await dashboardNotificationsService.sendNotification(
        "unknown-event",
        { id: "order-id" },
        null
      );

      expect(result).toEqual({
        to: "dashboard",
        status: "success",
        data: {
          title: "New Order",
          message: `New Order from ${order.customer.first_name} ${order.customer.last_name} with total ${order.total}`,
          order,
          customer: order.customer,
        },
      });
      expect(orderService.retrieve).toHaveBeenCalledWith("order-id");
      expect(logger.warn).toHaveBeenCalledWith("Unknown event unknown-event received");
    });
  });

  describe("resendNotification", () => {
    it("should throw an error", async () => {
      await expect(dashboardNotificationsService.resendNotification(null, null, null)).rejects.toThrow(
        "Method not implemented."
      );
    });
  });
});