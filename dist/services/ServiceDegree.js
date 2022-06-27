"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDegree = void 0;
const Degree_1 = require("../models/Degree");
class ServiceDegree {
    create(name, code) {
        return new Degree_1.Degree(name, code);
    }
}
exports.ServiceDegree = ServiceDegree;
//# sourceMappingURL=ServiceDegree.js.map