import { Router } from "express";
import Users from './users/users.dbclass.js';
import Products from './products/products.dbclass.js';

const users = new Users();
const manager = new Products();

const mainRoutes = (io, baseUrl, productsPerPage) => {
    const router = Router();
    
    router.get('/', async (req, res) => {
        if (req.session.userValidated) {
            // Esto permite hacer posteriores llamadas a este mismo endpoint con distintos offsets para el paginado
            if (req.query.page === undefined) req.query.page = 0;

            // Recordar que en este caso getProductsPaginated() utiliza el módulo paginate
            // que fue habilitado como plugin en el archivo de modelo, y este paginate retorna
            // un objeto contenido un item docs con el contenido de la consulta y una serie
            // de parámetros relacionados al paginado, que son los que pasamos debajo al render como pagination
            const result = await manager.getProductsPaginated(req.query.page * productsPerPage, productsPerPage);

            // Esto es solo un auxiliar para la plantilla de Handlebars, a efectos de evitar más código
            const pagesArray = [];
            for (let i = 0; i < result.totalPages; i++) pagesArray.push({ index: i, indexPgBar: i + 1 });
            
            const pagination = {
                baseUrl: baseUrl,
                limit: result.limit,
                offset: result.offset,
                totalPages: result.totalPages,
                totalDocs: result.totalDocs,
                page: result.page - 1,
                nextPageUrl: `${baseUrl}?page=${result.nextPage - 1}`,
                prevPageUrl: `${baseUrl}?page=${result.prevPage - 1}`,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                pagesArray: pagesArray
            }
            
            res.render('products', { products: result.docs, pagination: pagination });
        } else {
            res.render('login', {
                sessionInfo: req.session
            });
        }
    });

    router.get('/logout', async (req, res) => {
        req.session.destroy();

        // Se recarga la página base en el browser
        res.redirect(baseUrl);
    });

    router.post('/login', async (req, res) => {
        const { login_email, login_password } = req.body; // Desestructuramos el req.body
        const user = await users.validateUser(login_email, login_password);
        
        if (user === null) { // Datos no válidos
            req.session.userValidated = false;
            req.session.errorMessage = 'Usuario o clave no válidos';
        } else {
            req.session.userValidated = true;
            req.session.errorMessage = '';
        }

        // Se recarga la página base en el browser
        res.redirect(baseUrl);
    });
    
    return router;
}

export default mainRoutes;