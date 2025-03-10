import express from 'express'
import { getMarkets, getSiloRewards } from '../controller/marketsController'

const router = express.Router()

router.route("/get-markets").get(getMarkets)
router.route("/silo/rewards").get(getSiloRewards)


export default router