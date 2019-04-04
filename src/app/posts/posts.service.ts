import { PostModel } from "./post.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: PostModel[] = [];
  private postsUpdated = new Subject<PostModel[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(category: string, pagesize, page) {
    const queryParams = `?category=${category}&pagesize=${pagesize}&page=${page}`;
    this.http
      .get<{ message: string; posts: any }>(
        `http://localhost:3000/api/posts${queryParams}`
      )
      // Changes _id to id to match field in PostModel
      .pipe(
        map(postData => {
          return postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              category: post.category,
              id: post._id,
              imagePath: post.imagePath
            };
          });
        })
      )
      .subscribe(transfromedPosts => {
        this.posts = transfromedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      category: string;
      content: string;
      imagePath: string;
    }>(`http://localhost:3000/api/posts/${id}`);
  }

  addPost(newPost: PostModel, image: File) {
    const postData = new FormData();
    postData.append("title", newPost.title);
    postData.append("category", newPost.category);
    postData.append("image", image, newPost.title);
    postData.append("content", newPost.content);

    this.http
      .post<{ message: string; post: PostModel }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(res => {
        newPost.id = res.post.id;
        newPost.imagePath = res.post.imagePath;
        this.posts.push(newPost);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    category: string,
    image: File | string
  ) {
    let postData: PostModel | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("category", category);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        category: category,
        content: content,
        imagePath: image
      };
    }
    this.http
      .put("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: PostModel = {
          id: id,
          title: title,
          category: category,
          content: content,
          imagePath: ""
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete(`http://localhost:3000/api/posts/${postId}`)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
