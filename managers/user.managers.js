const crypto= require ('node:crypto')

class usermanager{
    constructor(){
        this.users = []
    }
    createuser(obj){
        const user ={...obj}
        user.salt =crypto.randomBytes
    }
}