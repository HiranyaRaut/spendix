package com.spendix.backend.repository;

import com.spendix.backend.entity.Group;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByUser(User user);
}
