package com.spandana.photohouse.repository;

import com.spandana.photohouse.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r.stars, COUNT(r) FROM Rating r GROUP BY r.stars")
    List<Object[]> countByStars();
}
