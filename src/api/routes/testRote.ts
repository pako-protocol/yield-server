import express from 'express'
import { getTokens } from '../controller/tokensController'
import { getPools } from '../controller/poolsController'
import { testGetLtv } from '../controller/testingController'

const router = express.Router()

router.route("/").get(testGetLtv)

export default router