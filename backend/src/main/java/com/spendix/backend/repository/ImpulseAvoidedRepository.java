package com.spendix.backend.repository;

import com.spendix.backend.entity.ImpulseAvoided;
import com.spendix.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImpulseAvoidedRepository extends JpaRepository<ImpulseAvoided, Long> {
    List<ImpulseAvoided> findByUser(User user);
}
