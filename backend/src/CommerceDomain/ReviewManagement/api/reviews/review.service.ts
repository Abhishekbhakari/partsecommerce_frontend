import ReviewRepository from './repository/review.repository';
import { buildPagination } from '../../../../Common/utils/Pagination';
import { DuplicateRecordException, ForbiddenException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { CreateReviewPayload } from './validations/review.validation';

class ReviewService {
    async listForProduct(productId: number, page: number, pageSize: number, offset: number, limit: number) {
        const { rows, count } = await ReviewRepository.findAllForProduct(productId, offset, limit);
        const avgRating = rows.length ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length : 0;
        return { items: rows, avgRating, ...buildPagination(count, page, pageSize) };
    }

    async create(productId: number, userId: number, payload: CreateReviewPayload) {
        const orderItem = await ReviewRepository.findVerifiedOrderItem(userId, productId);
        if (!orderItem) {
            throw new ForbiddenException('You can only review products you have purchased.');
        }

        const existing = await ReviewRepository.findExisting(userId, orderItem.id);
        if (existing) throw new DuplicateRecordException('You have already reviewed this purchase.');

        const review = await ReviewRepository.create({
            productId,
            userId,
            orderItemId: orderItem.id,
            rating: payload.rating,
            comment: payload.comment,
            status: 'pending'
        });

        return review;
    }

    async moderate(id: number, status: string) {
        const review = await ReviewRepository.findById(id);
        if (!review) throw new RecordNotFoundException('Review not found.');
        await ReviewRepository.updateStatus(id, status);
        if (status === 'approved' || status === 'rejected') {
            await ReviewRepository.recalculateProductRating(review.productId);
        }
        return ReviewRepository.findById(id);
    }

    async remove(id: number) {
        const review = await ReviewRepository.findById(id);
        if (!review) throw new RecordNotFoundException('Review not found.');
        await ReviewRepository.remove(id);
        await ReviewRepository.recalculateProductRating(review.productId);
        return { success: true };
    }
}

export default new ReviewService();
