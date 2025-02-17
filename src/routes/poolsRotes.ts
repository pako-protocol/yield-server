import express from 'express'
import { getTokens } from '../controller/tokensController'
import { getPools } from '../controller/poolsController'

const router = express.Router()

router.route("/get-pools").get(getPools)

export default router