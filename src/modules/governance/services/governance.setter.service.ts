import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CachingService } from 'src/services/caching/cache.service';
import { CacheTtlInfo } from 'src/services/caching/cache.ttl.info';
import { GenericSetterService } from 'src/services/generics/generic.setter.service';
import { Logger } from 'winston';
import { ProposalVotes } from '../models/governance.proposal.votes.model';
import { VoteType } from '../models/governance.proposal.model';

export class GovernanceSetterService extends GenericSetterService {
    constructor(
        protected readonly cachingService: CachingService,
        @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
    ) {
        super(cachingService, logger);
        this.baseKey = 'governance';
    }

    async userVotedProposals(scAddress: string, userAddress: string, value: number[]): Promise<string> {
        return await this.setData(
            this.getCacheKey('userVotedProposals', scAddress, userAddress),
            value,
            CacheTtlInfo.ContractState.remoteTtl,
            CacheTtlInfo.ContractState.localTtl,
        );
    }

    async userVotedProposalsWithVoteType(scAddress: string, userAddress: string, value: { proposalId: number, vote: VoteType }[]): Promise<string> {
        return await this.setData(
            this.getCacheKey('userVotedProposalsWithVoteType', scAddress, userAddress),
            value,
            CacheTtlInfo.ContractState.remoteTtl,
            CacheTtlInfo.ContractState.localTtl,
        );
    }

    async proposalVotes(scAddress: string, proposalId: number, value: ProposalVotes): Promise<string> {
        return await this.setData(
            this.getCacheKey('proposalVotes', scAddress, proposalId),
            value,
            CacheTtlInfo.ContractState.remoteTtl,
            CacheTtlInfo.ContractState.localTtl,
        );
    }
}
