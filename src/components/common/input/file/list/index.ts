import { ListFile } from './list'
import { ListFileImage } from './list-image/list-image'

export const List = Object.assign(ListFile, {
    Image: ListFileImage,
    // outros tipos de ListFile
})

export default List;