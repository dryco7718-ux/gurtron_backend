import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteDataRouter from "./site-data";
import uploadRouter from "./upload";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/site-data", siteDataRouter);
router.use("/reviews", reviewsRouter);
router.use("/upload", uploadRouter);

export default router;
