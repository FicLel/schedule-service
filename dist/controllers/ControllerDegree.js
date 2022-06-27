"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServiceDegree_1 = require("../services/ServiceDegree");
class ControllerDegree {
    createDegree(req, res) {
        const { name, code } = req.body;
        const degree = new ServiceDegree_1.ServiceDegree().create(name, code);
        res.status(201).json(degree);
    }
}
;
exports.default = (router) => {
    const controller = new ControllerDegree();
    router.post('/degree', controller.createDegree);
};
//# sourceMappingURL=ControllerDegree.js.map