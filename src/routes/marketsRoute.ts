import express from 'express'
import { getMarkets } from '../controller/marketsController'

const router = express.Router()

router.route("/get-markets").get(getMarkets)

export default router