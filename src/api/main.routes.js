import { Router } from "express";
import Users from './users/users.dbclass.js';
import Products from './products/products.dbclass.js';

const users = new Users();
const manager = new Products();

const mainRoutes = (io, store, baseUrl, productsPerPage) => {
    const router = Router();

    router.get('/', async (req, res) => {        
        // Tratamos de reguperar los datos de sesión, en caso de cumplirse el TTL por ejemplo
        // data será null y de esa forma podremos redireccionar al login aunque el usuario
        // haya dejado su sesion abierta. Esta es una opción sencilla de control que funciona
        // bien con el almacenamiento de sesiones en MongoDB, pero pueden requerirse ajustes
        // para trabajar con almacenamiento en archivos.
        store.get(req.sessionID, async (err, data) => {
            if (err) console.log(`Error al recuperar datos de sesión (${err})`);

            if (data !== null && (req.session.userValidated || req.sessionStore.userValidated)) {
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
    
                // Si userValidated es true, significa que el login fue correcto y se renderiza la lista
                // de productos (obviamente podrían renderizarse otras páginas en función de lo elegido
                // en un menu por ejemplo)
                res.render('products', { products: result.docs, pagination: pagination });
            } else {
                // Si userValidated es false, hubo un error en los datos, se vuelve al login
                res.render('login', {
                    sessionInfo: req.session.userValidated !== undefined ? req.session : req.sessionStore
                });
            }
        }); 
    });

    router.get('/logout', async (req, res) => {
        req.session.userValidated = req.sessionStore.userValidated = false;

        req.session.destroy((err) => {
            req.sessionStore.destroy(req.sessionID, (err) => {
                if (err) console.log(`Error al destruir sesión (${err})`);

                // Se recarga la página base en el browser
                console.log('Sesión destruída');
                res.redirect(baseUrl);
            });
        })
    });

    router.post('/login', async (req, res) => {
        const { login_email, login_password } = req.body; // Desestructuramos el req.body
        const user = await users.validateUser(login_email, login_password);

        if (user === null) { // Datos no válidos
            req.session.userValidated = req.sessionStore.userValidated = false;
            req.session.errorMessage = req.sessionStore.errorMessage = 'Usuario o clave no válidos';
        } else {
            req.session.userValidated = req.sessionStore.userValidated = true;
            req.session.errorMessage = req.sessionStore.errorMessage = '';
        }

        // Se recarga la página base en el browser
        res.redirect(baseUrl);
    });

    return router;
}

export default mainRoutes;