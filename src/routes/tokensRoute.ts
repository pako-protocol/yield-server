import express from 'express'
import { getTokens } from '../controller/tokensController'

const router = express.Router()

router.route("/get-tokens").get(getTokens)

export default router