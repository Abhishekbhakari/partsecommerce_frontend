import { Router } from 'express';
import SearchController from './search.controller';

const autocompleteRouter = Router();
autocompleteRouter.get('/', SearchController.autocomplete);

const searchRouter = Router();
searchRouter.get('/', SearchController.fullSearch);

export { autocompleteRouter, searchRouter };
