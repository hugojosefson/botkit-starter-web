import server from './server'
import app from './app'

export default options => server(app(), options)
