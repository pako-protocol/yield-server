import express from 'express'
import { getSilos } from '../controller/vaultsController'

const router = express.Router()

router.route("/vaults").get(getSilos)

export default router