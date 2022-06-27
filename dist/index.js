"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const variables_1 = require("./environment/variables");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const ControllerDegree_1 = __importDefault(require("./controllers/ControllerDegree"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
(0, ControllerDegree_1.default)(router);
app.use(body_parser_1.default.json()); // for parsing application/json
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/', router);
app.listen(variables_1.PORT, () => {
    console.log(`SERVER RUNNING ON ${variables_1.PORT}`);
});
//# sourceMappingURL=index.js.map