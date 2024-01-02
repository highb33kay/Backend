import { Response, Request, NextFunction } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "../middlewares";
import { ResponseHandler } from "../utils";
import { v4 as uuidv4 } from "uuid";

import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

import { userInterface } from "../interfaces/user.interface";

// validate id
const validateId = (id: string): string | null => {
  return uuidv4(id);
};

// get user profile by id
const getUserProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    if (!id) {
      throw new BadRequestError("User id is required");
    }

    const isValidId: string | null = validateId(id);

    if (!isValidId) {
      throw new BadRequestError("Invalid user id format");
    }

    const user = await prisma.user.findUnique({
      where: { userID: id },
      select: {
        userID: true,
        email: true,
        bio: true,
        socialLinks: true,
        websiteURL: true,
        profileImage: true,
        googleAccountID: true,
        displayName: true,
        firstName: true,
        lastName: true,
        slug: true,
        role: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const requestingUserId = req.params.id; // Assuming you have a user object in the request
    if (requestingUserId !== user.userID) {
      throw new UnauthorizedError(
        "You do not have permission to view this profile"
      );
    }

    ResponseHandler.success(
      res,
      user,
      200,
      "User profile fetched successfully"
    );
  } catch (error) {
    //   check for prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
      }
      console.log(error.message);
    }

    next(error);
  }
};

const updateUserProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  // destructuring the request body

  try {
    const { firstName, lastName, displayName, bio, websiteURL, location } =
      req.body as userInterface;

    // find the user by id
    const user = await prisma.user.findUnique({
      where: { userID: id },
      select: {
        userID: true,
        bio: true,
        websiteURL: true,
        profileImage: true,
        displayName: true,
        firstName: true,
        lastName: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // check if the user is the same as the one updating the profile
    const requestingUserId = req.params.id; // Assuming you have a user object in the request
    if (requestingUserId !== user.userID) {
      throw new UnauthorizedError(
        "You do not have permission to view this profile"
      );
    }

    // update the user profile
    const updatedUser = await prisma.user.update({
      where: { userID: id },
      data: {
        firstName,
        lastName,
        displayName,
        bio,
        websiteURL,
        location,
      },
    });

    ResponseHandler.success(
      res,
      updatedUser,
      200,
      "User profile updated successfully"
    );
  } catch (error) {
    //   check for prisma errors
    next(error);
  }
};
export { getUserProfileById, updateUserProfileById };
