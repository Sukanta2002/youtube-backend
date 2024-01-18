import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: testing required
  return res.status(200).json(new ApiResponce(200, { status: "ok" }, "ok"));
});

export { healthcheck };
