Feature: Auth profile

  Scenario: Update profile name
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    When I update the profile name to "Janet" and "Smith"
    Then the profile should be named "Janet" "Smith"

  Scenario: Update password with correct current password
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    When I update the password to "newpass456" with current password "secret123"
    Then the profile should have the new password "newpass456"

  Scenario: Prevent updating password with incorrect current password
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    When I try to update the password to "newpass456" with current password "wrongpass"
    Then I should receive a profile error saying "Current password is incorrect"

  Scenario: Request password reset for unknown email does nothing
    When I request a password reset for "unknown@example.com"
    Then no reset token should be stored for "unknown@example.com"

  Scenario: Request password reset stores a token
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    When I request a password reset for "user@example.com"
    Then a reset token should be stored for "user@example.com"

  Scenario: Reset password with invalid token fails
    When I try to reset the password with token "invalid-token" to "newpass456"
    Then I should receive a reset error saying "Invalid or expired token"

  Scenario: Reset password with expired token fails
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    And an expired reset token for "user@example.com"
    When I try to reset the password with the stored token to "newpass456"
    Then I should receive a reset error saying "Invalid or expired token"

  Scenario: Reset password with valid token succeeds
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    And a reset token for "user@example.com"
    When I reset the password with the stored token to "newpass456"
    Then the profile should have the new password "newpass456"
    And no reset token should be stored for "user@example.com"

  Scenario: Verify email with invalid token fails
    When I try to verify the email with token "invalid-token"
    Then I should receive a verify error saying "Invalid verification token"

  Scenario: Verify email with valid token succeeds
    Given a registered user "user@example.com" with password "secret123" named "Jane" "Doe"
    And a verification token for "user@example.com"
    When I verify the email with the stored token
    Then the email should be verified for "user@example.com"
    And no verification token should be stored for "user@example.com"
