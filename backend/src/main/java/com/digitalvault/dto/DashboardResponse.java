package com.digitalvault.dto;

public class DashboardResponse {
    private String name;
    private String email;
    private long fileCount;
    private long noteCount;
    private long credentialCount;

    public DashboardResponse() {
    }

    public DashboardResponse(String name, String email, long fileCount, long noteCount, long credentialCount) {
        this.name = name;
        this.email = email;
        this.fileCount = fileCount;
        this.noteCount = noteCount;
        this.credentialCount = credentialCount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getFileCount() {
        return fileCount;
    }

    public void setFileCount(long fileCount) {
        this.fileCount = fileCount;
    }

    public long getNoteCount() {
        return noteCount;
    }

    public void setNoteCount(long noteCount) {
        this.noteCount = noteCount;
    }

    public long getCredentialCount() {
        return credentialCount;
    }

    public void setCredentialCount(long credentialCount) {
        this.credentialCount = credentialCount;
    }
}
