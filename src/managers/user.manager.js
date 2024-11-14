import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto'
import path from 'path'

class UserManager {
    constructor(path) {
        this.path = path;
    }

    #createHash(user) {
        user.salt = crypto.randomBytes(128).toString();
        user.password = crypto
            .createHmac("sha256", user.salt)
            .update(user.password)
            .digest("hex");
    }

    async getUsers() {
        if (fs.existsSync(this.path)) {
            const users = await fs.promises.readFile(this.path, "utf-8");
            return JSON.parse(users);
        } else return [];
    }

    async createUser(obj) {
        const user = {
            id: uuidv4(),
            ...obj,
        };
        const users = await this.getUsers();
        const userExist = users.find((u) => u.email === user.email);
        if (userExist) throw new Error("User already exists");
        this.#createHash(user);
        users.push(user);
        await fs.promises.writeFile(this.path, JSON.stringify(users));
        return user;
    }

    async getUserById(id) {
        const users = await this.getUsers();
        if (!users.length > 0) throw new Error("list users is empty");
        const user = users.find((user) => user.id === id);
        if (!user) throw new Error("user not found");
        return user;
    }

    async updateUser(obj, id) {
        const users = await this.getUsers();
        let user = await this.getUserById(id);
        user = { ...user, ...obj };
        if (obj.password) this.#createHash(user);
        const newArray = users.filter((user) => user.id !== id);
        newArray.push(user);
        await fs.promises.writeFile(this.path, JSON.stringify(newArray));
        return user;
    }

    async deleteUser(id) {
        const user = await this.getUserById(id);
        const users = await this.getUsers();
        const newArray = users.filter((user) => user.id !== id);
        await fs.promises.writeFile(this.path, JSON.stringify(newArray));
        return user;
    }

    async deleteUsers() {
        const users = await this.getUsers();
        if (!users.length > 0) throw new Error("users is empty");
        await fs.promises.unlink(this.path);
    }
}

export const userManager = new UserManager(path.join(process.cwd(), "src/data/users.json"));