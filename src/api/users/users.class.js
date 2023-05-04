import fs from 'fs';
import crypto from 'crypto';

class Users {
    constructor(path) {
        this.path = path; // Ruta archivo registro usuarios
        this.latestId = 1;
        this.users = [];
        this.status = 0;
        this.statusMsg = "inicializado";
    }

    static requiredFields = ['firstName', 'lastName', 'userName', 'password'];

    static #verifyRequiredFields = (obj) => {
        return Users.requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== null);
    }

    static #generarSha256 = (pass) => {
        return crypto.createHash('sha256').update(pass).digest('hex');
    }

    static #objEmpty (obj) {
        return Object.keys(obj).length === 0;
    }

    #readUsersFromFile = async () => {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return data === '' ? [] : JSON.parse(data);
    }


    checkStatus = () => {
        return this.status;
    }

    showStatusMsg = () => {
        return this.statusMsg;
    }

    addUser = async (user) => {
        try {
            if (!Users.#objEmpty(user) && Users.#verifyRequiredFields(user)) {
                user.password = Users.#generarSha256(user.password);
                this.users = await this.#readUsersFromFile();

                this.latestId = this.users[this.users.length - 1].id;
                this.users.push({ id: ++this.latestId, ...user });
                await fs.promises.writeFile(this.path, JSON.stringify(this.users));
                
                this.status = 1;
                this.statusMsg = "Usuario registrado en archivo";
            } else {
                this.status = -1;
                this.statusMsg = `Faltan campos obligatorios (${Users.requiredFields.join(', ')})`;
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `AddUser: ${err}`;
        }
    }

    getUsers = async () => {
        try {
            const users = await this.#readUsersFromFile();
            this.status = 1;
            this.statusMsg = 'Usuarios recuperados';
            return users;
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getUsers: ${err}`;
        }
    }

    getUserById = async (id) => {
        try {
            this.status = 1;
            const users = await this.#readUsersFromFile();
            const user = users.find(user => user.id === id);

            if (user) return user;

            this.status = -1;
            this.statusMsg = "Usuario no encontrado";
            return {};
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getUserById: ${err}`;
        }
    }

    updateUser = async (id, field, data) => {
        try {
            if (id == undefined || field == undefined || data == undefined) {
                this.status = -1;
                this.statusMsg = "Se requiere body con id, field y data";
            } else {
                const users = await this.#readUsersFromFile();
                const index = users.findIndex(user => user.id === id);
    
                if (index === -1) {
                    this.status = -1;
                    this.statusMsg = "ID no encontrado";
                    return;
                }
    
                users[index][field] = data;
                await fs.promises.writeFile(this.path, JSON.stringify(users));
                this.status = 1;
                this.statusMsg = "Usuario actualizado";
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `updateUser: ${err}`;
        }
    }

    deleteUser = async (id) => {
        try {
            const users = await this.#readUsersFromFile();
            const usersFiltered = users.filter(user => user.id !== id);

            if (usersFiltered.length === users.length) {
                this.status = -1;
                this.statusMsg = "ID no encontrado";
                return;
            }

            await fs.promises.writeFile(this.path, JSON.stringify(usersFiltered));
            this.status = 1;
            this.statusMsg = "Usuario borrado";
        } catch (err) {
            this.status = -1;
            this.statusMsg = `deleteUser: ${err}`;
        }
    }

    validateUser = async (user, pass) => {
        try {
            const users = await this.#readUsersFromFile();
            const userExist = users.find(item => item.userName === user);
            if (!userExist) {
                this.status = "Usuario no válido";
                return {};
            }

            const match = users.find(user => user.password === Users.#generarSha256(pass));
            if (match) {
                return match;
            }

            this.status = "Contraseña no válida";
            return {};
        } catch (err) {
            this.status = `validateUser: ${err}`;
        }
    }
}

export default Users;
