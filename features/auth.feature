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
