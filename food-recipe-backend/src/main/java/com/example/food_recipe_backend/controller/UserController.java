
package com.example.food_recipe_backend.controller;

import com.example.food_recipe_backend.entity.User;
import com.example.food_recipe_backend.repository.UserRepository;
import com.example.food_recipe_backend.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder encoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public record RegisterRequest(
        String name,
        String email,
        String password
    ) {}

    public record LoginRequest(
        String email,
        String password
    ) {}

    public record SafeUser(
        Long id,
        String name,
        String email
    ) {}

    public record LoginResponse(
        String token,
        SafeUser user
    ) {}

    private SafeUser safeUser(User user) {
        return new SafeUser(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public SafeUser register(
            @RequestBody RegisterRequest request) {

        if (request.name() == null ||
            request.name().isBlank() ||
            request.email() == null ||
            request.email().isBlank() ||
            request.password() == null ||
            request.password().length() < 8) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Enter name, email and password of at least 8 characters"
            );
        }

        String email = request.email().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        User user = new User(
            request.name().trim(),
            email,
            encoder.encode(request.password())
        );

        return safeUser(userRepository.save(user));
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        if (request.email() == null ||
            request.password() == null) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        User user = userRepository
            .findByEmail(request.email().trim())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
                )
            );

        String storedPassword = user.getPassword();

        boolean bcrypt = storedPassword != null &&
            storedPassword.matches("^\\$2[aby]\\$.*");

        boolean valid = bcrypt
            ? encoder.matches(request.password(), storedPassword)
            : request.password().equals(storedPassword);

        if (!valid) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        // Upgrade passwords stored by the old login system
        if (!bcrypt) {
            user.setPassword(encoder.encode(request.password()));
            userRepository.save(user);
        }

        return new LoginResponse(
            jwtService.generateToken(user.getId()),
            safeUser(user)
        );
    }

    @GetMapping("/me")
    public SafeUser currentUser(Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        User user = userRepository.findById(userId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not found"
                )
            );

        return safeUser(user);
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of(
            "message",
            "Remove the token on the frontend"
        );
    }
}
