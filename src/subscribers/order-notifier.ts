import { NotificationService,Logger,EventBusService} from "@medusajs/medusa" ;

type InjectedDependencies = {
  notificationService: NotificationService,
  logger: Logger,
  eventBusService: EventBusService,

}
class OrderNotifierSubscriber {
  protected notificationService_: NotificationService
    constructor({notificationService,logger,eventBusService}: InjectedDependencies) {
      this.notificationService_ = notificationService

      eventBusService.subscribe("order.placed",this.handleOrderPlaced)
      eventBusService.subscribe("cart.updated",this.handleCartUpdated)
      
    }

    handleOrderPlaced = async (data: any) => {
      this.notificationService_.send("order.placed",data,"dashboard-notifications")
    }
    handleCartUpdated = async (data: any) => {
      this.notificationService_.send("cart.updated",data,"dashboard-notifications")
    }
  }

  export default OrderNotifierSubscriber



