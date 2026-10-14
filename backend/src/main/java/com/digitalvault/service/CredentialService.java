package com.digitalvault.service;

import com.digitalvault.dto.CredentialRequest;
import com.digitalvault.dto.CredentialResponse;
import com.digitalvault.entity.Credential;
import com.digitalvault.entity.User;
import com.digitalvault.exception.ApiException;
import com.digitalvault.repository.CredentialRepository;
import com.digitalvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class CredentialService {
    private static final String VERSION_PREFIX = "v1:";
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final CredentialRepository credentialRepository;
    private final UserRepository userRepository;
    private final SecretKeySpec encryptionKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public CredentialService(CredentialRepository credentialRepository,
                             UserRepository userRepository,
                             @Value("${app.credential.encryption-key}") String base64EncryptionKey) {
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64EncryptionKey);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("CREDENTIAL_ENCRYPTION_KEY must be Base64-encoded.", ex);
        }
        if (keyBytes.length != 32) {
            throw new IllegalStateException("CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes.");
        }
        this.encryptionKey = new SecretKeySpec(keyBytes, "AES");
    }

    @Transactional(readOnly = true)
    public List<CredentialResponse> getCredentials(String email) {
        User user = getUserByEmail(email);
        return credentialRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
    }

    @Transactional
    public CredentialResponse createCredential(String email, CredentialRequest request) {
        User user = getUserByEmail(email);
        Credential credential = new Credential();
        credential.setUser(user);
        credential.setServiceName(request.getServiceName().trim());
        credential.setUsername(request.getUsername().trim());
        credential.setEncryptedPassword(encrypt(request.getPassword()));
        return toResponse(credentialRepository.save(credential));
    }

    @Transactional
    public CredentialResponse updateCredential(String email, Long id, CredentialRequest request) {
        Credential credential = findCredential(id, getUserByEmail(email));
        credential.setServiceName(request.getServiceName().trim());
        credential.setUsername(request.getUsername().trim());
        credential.setEncryptedPassword(encrypt(request.getPassword()));
        return toResponse(credentialRepository.save(credential));
    }

    @Transactional(readOnly = true)
    public String revealPassword(String email, Long id) {
        Credential credential = findCredential(id, getUserByEmail(email));
        return decrypt(credential.getEncryptedPassword());
    }

    @Transactional
    public void deleteCredential(String email, Long id) {
        credentialRepository.delete(findCredential(id, getUserByEmail(email)));
    }

    private Credential findCredential(Long id, User user) {
        return credentialRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApiException("Credential not found or access denied"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found"));
    }

    private CredentialResponse toResponse(Credential credential) {
        return new CredentialResponse(credential.getId(), credential.getServiceName(),
                credential.getUsername(), credential.getCreatedAt());
    }

    private String encrypt(String plaintext) {
        try {
            byte[] nonce = new byte[NONCE_BYTES];
            secureRandom.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey, new GCMParameterSpec(TAG_BITS, nonce));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(nonce.length + encrypted.length).put(nonce).put(encrypted).array();
            return VERSION_PREFIX + Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Could not encrypt credential.", ex);
        }
    }

    private String decrypt(String storedValue) {
        if (!storedValue.startsWith(VERSION_PREFIX)) {
            throw new ApiException("This credential uses the previous encryption format and must be re-saved.");
        }
        try {
            byte[] payload = Base64.getDecoder().decode(storedValue.substring(VERSION_PREFIX.length()));
            if (payload.length <= NONCE_BYTES) throw new GeneralSecurityException("Incomplete encrypted value.");
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] nonce = new byte[NONCE_BYTES];
            buffer.get(nonce);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey, new GCMParameterSpec(TAG_BITS, nonce));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException ex) {
            throw new IllegalStateException("Could not decrypt credential. Verify CREDENTIAL_ENCRYPTION_KEY.", ex);
        }
    }
}
