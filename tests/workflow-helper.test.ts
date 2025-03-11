import type { WorkflowContracts, WorkflowModels } from '@kontent-ai/management-sdk';
import { describe, expect, it } from 'vitest';
import { workflowHelper } from '../lib/index.js';

describe('findShortestPathBetweenSteps', () => {
    const createWorkflow = (steps: Array<WorkflowContracts.IWorkflowStepNewContract>): Readonly<WorkflowModels.Workflow> => {
        const workflow: Omit<WorkflowModels.Workflow, '_raw'> = {
            id: 'workflow_001',
            name: 'Content Publishing Workflow',
            codename: 'content_publishing_workflow',
            scopes: [], // Empty array as requested
            steps,
            publishedStep: {
                id: 'publish_step_id',
                name: 'Publish',
                codename: 'publish_step',
                create_new_version_role_ids: [],
                unpublish_role_ids: []
            },
            scheduledStep: {
                id: 'scheduled_step_id',
                name: 'Scheduled',
                codename: 'scheduled_step'
            },
            archivedStep: {
                id: 'archived_step_id',
                name: 'Archived',
                codename: 'archived_step',
                role_ids: []
            }
        };

        return workflow as WorkflowModels.Workflow;
    };

    const createStep = (
        id: string,
        codename: string,
        transitions_to: ReadonlyArray<string>
    ): Readonly<WorkflowContracts.IWorkflowStepNewContract> => ({
        id,
        name: '',
        codename,
        color: 'sky-blue',
        role_ids: [],
        transitions_to: transitions_to.map((id) => ({ step: { id } }))
    });

    it('correctly returns array of codenames between steps with multiple paths', () => {
        const typeWorkflow = createWorkflow([
            createStep('step_001', 'step_1', ['step_002', 'step_003']),
            createStep('step_002', 'step_2', ['step_004']),
            createStep('step_003', 'step_3', ['publish_step_id']),
            createStep('step_004', 'step_4', ['publish_step_id'])
        ]);
        const workflowHelp = workflowHelper([typeWorkflow]);

        const result = workflowHelp.findShortestPathBetweenSteps(
            typeWorkflow,
            workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'step_1'),
            workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'publish_step')
        );

        expect(result).toStrictEqual([{ stepCodename: 'step_3' }, { stepCodename: 'publish_step' }]);
    });

    it('correctly returns array of codenames between steps', () => {
        const typeWorkflow = createWorkflow([
            createStep('step_001', 'step_1', ['step_002']),
            createStep('step_002', 'step_2', ['publish_step_id'])
        ]);
        const workflowHelp = workflowHelper([typeWorkflow]);

        const result = workflowHelp.findShortestPathBetweenSteps(
            typeWorkflow,
            workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'step_1'),
            workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'publish_step')
        );

        expect(result).toStrictEqual([{ stepCodename: 'step_2' }, { stepCodename: 'publish_step' }]);
    });

    it('throw error if path does not exist', () => {
        const typeWorkflow = createWorkflow([
            createStep('step_001', 'step_1', ['step_002']),
            createStep('step_002', 'step_2', ['step_003']),
            createStep('step_003', 'step_3', [])
        ]);

        const workflowHelp = workflowHelper([typeWorkflow]);

        const run = () =>
            workflowHelp.findShortestPathBetweenSteps(
                typeWorkflow,
                workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'draft_step'),
                workflowHelp.getWorkflowStepByCodename(typeWorkflow, 'publish_step')
            );

        expect(run).toThrow();
    });
});
