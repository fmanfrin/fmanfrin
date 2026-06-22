import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import {
  calculateTrainingPoints,
  awardPoints,
  updateEmployeeLevel,
  checkAndAwardBadges,
  getEmployeeGamificationStatus,
} from '@/lib/services/gamification';

/**
 * Process training completion
 * Awards points, updates levels, checks badges
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get attempt details
    const attempt = await db.getTrainingAttempt(params.id);
    if (!attempt || attempt.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Invalid training attempt' },
        { status: 400 }
      );
    }

    // Get training details
    const training = await db.getTraining(attempt.training_id);
    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    // Get employee details
    const employee = await db.getEmployee(attempt.employee_id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const isPerfectScore = attempt.percentage_score === 100;
    const timeMinutes =
      (new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()) / 60000;
    const isQuickCompletion =
      timeMinutes < (training.estimated_duration_minutes || 60) * 0.5;
    const isApproved = attempt.percentage_score >= (training.min_pass_score || 70);

    // Calculate points
    const pointsConfig = calculateTrainingPoints({
      percentageScore: attempt.percentage_score || 0,
      timeMinutes,
      estimatedTimeMinutes: training.estimated_duration_minutes || 60,
      maxPoints: training.max_points || 100,
      isPerfectScore,
      isQuickCompletion,
    });

    // Only award points if approved
    let awardedPoints = 0;
    const events = [];

    if (isApproved) {
      // Award base points
      await awardPoints({
        organizationId: employee.organization_id,
        employeeId: employee.id,
        eventType: 'training_completion',
        points: pointsConfig.basePoints,
        trainingId: training.id,
        description: `Completou: ${training.title}`,
      });

      events.push({
        type: 'training_completion',
        points: pointsConfig.basePoints,
      });

      awardedPoints = pointsConfig.basePoints;

      // Award perfect score bonus
      if (isPerfectScore) {
        await awardPoints({
          organizationId: employee.organization_id,
          employeeId: employee.id,
          eventType: 'perfect_score',
          points: pointsConfig.bonusPoints,
          trainingId: training.id,
          description: 'Nota máxima (100%)',
        });

        events.push({
          type: 'perfect_score',
          points: pointsConfig.bonusPoints,
        });

        awardedPoints += pointsConfig.bonusPoints;
      }

      // Award quick completion bonus
      if (isQuickCompletion) {
        const bonusForSpeed = Math.round(training.max_points * 0.1);
        await awardPoints({
          organizationId: employee.organization_id,
          employeeId: employee.id,
          eventType: 'quick_completion',
          points: bonusForSpeed,
          trainingId: training.id,
          description: 'Conclusão rápida',
        });

        events.push({
          type: 'quick_completion',
          points: bonusForSpeed,
        });

        awardedPoints += bonusForSpeed;
      }
    }

    // Update level
    const { levelChanged, newLevel } = await updateEmployeeLevel(
      employee.id,
      employee.organization_id
    );

    // Check and award badges
    const awardedBadges = [];
    if (isApproved) {
      const badges = await checkAndAwardBadges(
        employee.id,
        employee.organization_id,
        'training_completion',
        training.id
      );

      if (isPerfectScore) {
        const perfectScoreBadges = await checkAndAwardBadges(
          employee.id,
          employee.organization_id,
          'perfect_score'
        );
        awardedBadges.push(...perfectScoreBadges);
      }

      awardedBadges.push(...badges);
    }

    // Get updated gamification status
    const gamificationStatus = await getEmployeeGamificationStatus(
      employee.id,
      employee.organization_id
    );

    return NextResponse.json({
      success: true,
      points: {
        awarded: awardedPoints,
        breakdown: pointsConfig,
        totalPoints: gamificationStatus.totalPoints,
      },
      level: {
        current: newLevel,
        changed: levelChanged,
      },
      badges: {
        awarded: awardedBadges,
        total: gamificationStatus.badges.length,
      },
      gamificationStatus,
    });
  } catch (error) {
    console.error('Error processing training:', error);
    return NextResponse.json(
      { error: 'Failed to process training completion' },
      { status: 500 }
    );
  }
}
