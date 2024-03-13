#include "Camera.hpp"

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUp = cameraUp;
        this->cameraFront = glm::normalize(cameraTarget - cameraPosition);
        this->cameraRight = glm::normalize(glm::cross(cameraUp, cameraFront));
        this->yaw = this->pitch = 0.0f;

        //TODO - Update the rest of camera parameters

    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        return glm::lookAt(cameraPosition, cameraPosition + cameraFront, cameraUp);
    }

    glm::vec3 Camera::getCameraTarget()
    {
        return this->cameraTarget;
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO
        if (direction == MOVE_FORWARD) {
            this->cameraPosition += speed * cameraFront;
        }
        if (direction == MOVE_BACKWARD) {
            this->cameraPosition -= speed * cameraFront;
        }
        if (direction == MOVE_LEFT) {
            this->cameraPosition -= speed * glm::normalize(glm::cross(cameraFront, cameraUp));
        }
        if (direction == MOVE_RIGHT) {
            this->cameraPosition += speed * glm::normalize(glm::cross(cameraFront, cameraUp));
        }
    }



    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float xpos, float ypos, bool firstMouse) {
        if (firstMouse) {
            lastX = xpos;
            lastY = ypos;
            firstMouse = false;
        }

        float xoffset = xpos - lastX;
        float yoffset = lastY - ypos;
        lastX = xpos;
        lastY = ypos;

        float sensitivity = 0.1f;
        xoffset *= sensitivity;
        yoffset *= sensitivity;

        yaw += xoffset;
        pitch += yoffset;

        if (pitch > 89.0f)
            pitch = 89.0f;
        if (pitch < -89.0f)
            pitch = -89.0f;

        glm::yawPitchRoll(yaw, pitch, 0.0f);

        glm::vec3 direction;
        direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        direction.y = sin(glm::radians(pitch));
        direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        this->cameraFront = glm::normalize(direction);
    }
}