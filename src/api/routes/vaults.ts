import express from 'express'
import { getVaults } from '../controller/vaultsController'

const router = express.Router()

router.route("/get-vaults").get(getVaults)

export default router