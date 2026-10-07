import { Router } from 'express'
import controller from '../resources/stripe/webhooks/controller'

const router: Router = Router()

router.post('/checkout', controller.createCheckout)

// Higher level routes definition
export default router
